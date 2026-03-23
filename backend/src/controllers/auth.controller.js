const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { supabaseAdmin } = require("../services/supabase.service");

// Schema for validation
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid("candidate", "recruiter").default("candidate"),
  city: Joi.string().max(100).optional(),
  phone: Joi.string().max(15).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// signup controller
async function signup(req, res, next) {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password, full_name, role, city, phone } = value;
    const { data: existingUser } = await supabaseAdmin
      .from("users_meta")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users_meta")
      .insert({
        email,
        password_hash: hashedPassword,
        full_name,
        role,
        city: city || null,
        phone: phone || null,
      })
      .select()
      .single();

    if (insertError || !newUser) {
      console.log("Insert error:", insertError);
      return res.status(500).json({
        success: false,
        message: "Failed to create account.",
      });
    }

    // If candidate then create empty profile
    if (role === "candidate") {
      await supabaseAdmin.from("profiles").insert({
        user_id: newUser.id,
        full_name,
        email,
        phone: phone || null,
        city: city || null,
        completion_percent: 0,
      });
    }

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// login controller
async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = value;
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users_meta")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user. password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token",token)
    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// profile controller
async function getme(req, res, next) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users_meta")
      .select("id, email, full_name, role, city, phone, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

// logout controller
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

module.exports = {
  signup,
  login,
  getme,
  logout,
};
