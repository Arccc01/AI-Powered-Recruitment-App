require("dotenv").config();
const bcrypt = require("bcryptjs");
const { supabaseAdmin } = require("./services/supabase");

const seedDemoUsers = async () => {
  console.log("Seeding demo users...\n");

  const demoUsers = [
    {
      email: "hire-me@anshumat.org",
      password: "HireMe@2025!",
      full_name: "Demo Candidate",
      role: "candidate",
      city: "Mumbai",
    },
    {
      email: "recruiter@anshumat.org",
      password: "HireMe@2025!",
      full_name: "Demo Recruiter",
      role: "recruiter",
      city: "Delhi",
    },
  ];

  for (const user of demoUsers) {
    // Skip if already exists
    const { data: existing } = await supabaseAdmin
      .from("users_meta")
      .select("id")
      .eq("email", user.email)
      .single();

    if (existing) {
      console.log(` ${user.email} already exists, skipping.`);
      continue;
    }

    const password_hash = await bcrypt.hash(user.password, 12);

    const { data: newUser, error } = await supabaseAdmin
      .from("users_meta")
      .insert({ ...user, password_hash })
      .select()
      .single();

    if (error) {
      console.error(` Failed: ${user.email}`, error.message);
      continue;
    }

    if (user.role === "candidate") {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .insert({
          user_id: newUser.id,
          full_name: user.full_name,
          email: user.email,
          city: user.city,
          summary: "Passionate developer looking for exciting opportunities.",
          role: "Full Stack Developer",
          completion_percent: 40,
        })
        .select()
        .single();

      // Seed skills
      await supabaseAdmin.from("skills").insert([
        { profile_id: profile.id, skill_name: "JavaScript", level: "intermediate" },
        { profile_id: profile.id, skill_name: "React", level: "intermediate", ai_suggested: true },
        { profile_id: profile.id, skill_name: "Node.js", level: "beginner", ai_suggested: true },
      ]);

      // Seed experience
      await supabaseAdmin.from("experiences").insert([
        {
          profile_id: profile.id,
          company: "Tech Startup",
          role: "Frontend Intern",
          duration: "3 months",
          description: "Worked on building React components and improving UI.",
          ai_structured: {
            impact: "Improved page load time by 20%",
            technologies: ["React", "CSS", "JavaScript"],
          },
        },
      ]);
    }

    console.log(`Created ${user.role}: ${user.email}`);
  }

  console.log("\n Done!");
  console.log("Candidate → hire-me@anshumat.org / HireMe@2025!");
  console.log("Recruiter → recruiter@anshumat.org / HireMe@2025!");
  process.exit(0);
};

seedDemoUsers().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});