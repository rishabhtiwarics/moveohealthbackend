import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";

const JWT_SECRET = process.env.JWT_SECRET || "sourabh_admin_secret_key_12345";
const ADMIN_EMAIL = "rishabhtiwarics@gmail.com";
const DEFAULT_PASS = "admin@123";
const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "https://moveohealth.vercel.app"
).replace(/\/$/, "");

const getResendClient = () => {
  return new Resend(process.env.RESEND_API_KEY || "dummy_key_to_prevent_crash");
};

// Seed default admin account if not present
export const seedAdminUser = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASS, salt);
    
    const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!existingAdmin) {
      await Admin.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
      });
      console.log(`Default admin seeded successfully (${ADMIN_EMAIL})`);
    } else {
      // Ensure admin password is valid default if not set
      console.log(`Admin account present (${ADMIN_EMAIL})`);
    }
  } catch (error) {
    console.error("Error seeding default admin:", error);
  }
};

// Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password. Only admin credentials allowed." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log(`Admin login failed: password mismatch for ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      admin: {
        email: admin.email,
        companyName: "MoveO Health",
        logo: "/img/moveO_logo.png",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return res.status(400).json({ message: "Email not authorized for admin reset" });
    }

    const admin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    // Generate token and store directly for reliable matching
    const resetToken = crypto.randomBytes(20).toString("hex");
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins

    await admin.save();

    const resetUrl = `${FRONTEND_URL}/admin/reset-password/${resetToken}`;

    // Send email using Resend API
    let emailStatus = "sent";
    try {
      const resend = getResendClient();
      const emailResponse = await resend.emails.send({
        from: "MoveO Health Admin <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: "MoveO Health - Admin Password Reset Request & Invoice Link",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F6F9F7; padding: 40px 16px; margin: 0;">
            <div style="max-width: 540px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; padding: 40px 32px; box-shadow: 0 16px 40px rgba(1, 47, 37, 0.08); border: 1px solid rgba(1, 47, 37, 0.08); text-align: center;">
              
              <!-- Logo Header -->
              <div style="margin-bottom: 20px; text-align: center;">
                <img src="${FRONTEND_URL}/img/moveO_logo.png" alt="MoveO Health Logo" style="max-width: 160px; height: auto; display: inline-block;" />
                <h2 style="font-size: 24px; font-weight: 800; color: #012F25; margin: 12px 0 4px 0; letter-spacing: -0.01em;">MoveO Health</h2>
                <p style="font-size: 13px; font-weight: 600; color: #035D4E; margin: 0; text-transform: uppercase; letter-spacing: 0.08em;">Admin Portal Security</p>
              </div>

              <!-- Divider -->
              <div style="height: 1px; background-color: rgba(1, 47, 37, 0.08); margin: 24px auto; width: 85%;"></div>

              <!-- Email Body Content -->
              <h3 style="font-size: 20px; font-weight: 700; color: #012F25; margin: 0 0 12px 0;">Hello Admin,</h3>
              <p style="font-size: 15px; color: rgba(1, 47, 37, 0.75); line-height: 1.6; margin: 0 0 16px 0;">
                You requested a password reset for <strong style="color: #012F25;">${ADMIN_EMAIL}</strong>.
              </p>
              <p style="font-size: 14.5px; color: rgba(1, 47, 37, 0.7); margin: 0 0 28px 0;">
                Click the button below to complete your password reset:
              </p>

              <!-- Pill Button with SVG Key Icon -->
              <div style="margin: 32px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #012F25 0%, #035D4E 100%); color: #FFFFFF; padding: 15px 36px; text-decoration: none; border-radius: 999px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 10px 25px rgba(1, 47, 37, 0.25);">
                  Reset Admin Password &#128273;
                </a>
              </div>

              <!-- Secondary Link Box -->
              <div style="background-color: #F8FBF9; border: 1px solid rgba(1, 47, 37, 0.08); border-radius: 14px; padding: 20px; margin-top: 32px; text-align: center;">
                <p style="font-size: 13px; font-weight: 600; color: rgba(1, 47, 37, 0.65); margin: 0 0 10px 0;">Or copy and paste this link into your browser:</p>
                <p style="font-size: 13px; color: #035D4E; word-break: break-all; margin: 0 0 12px 0; font-weight: 600;">${resetUrl}</p>
                <p style="font-size: 12px; color: #B88335; font-weight: 700; margin: 0;">⏱️ This reset link will expire in 30 minutes.</p>
              </div>

              <!-- Footer -->
              <p style="font-size: 12px; color: rgba(1, 47, 37, 0.45); margin-top: 28px; margin-bottom: 0;">
                &copy; ${new Date().getFullYear()} MoveO Health. All rights reserved.
              </p>

            </div>
          </div>
        `,
      });
      console.log("Resend email FULL response:", JSON.stringify(emailResponse, null, 2));
      if (emailResponse?.error) {
        console.error("Resend returned error:", emailResponse.error);
        emailStatus = "resend_error";
      }
    } catch (resendError) {
      console.error("Resend API Email Error:", resendError);
      console.error("Resend Error Details:", JSON.stringify(resendError, null, 2));
      emailStatus = "failed";
    }

    res.json({
      success: true,
      message: `Password reset link sent to ${ADMIN_EMAIL} via Resend API`,
      resetUrl,
      emailStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Please enter a new password" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Search by exact token, hashed token, or active unexpired reset window
    let admin = await Admin.findOne({
      $or: [
        { resetPasswordToken: token },
        { resetPasswordToken: hashedToken }
      ],
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!admin) {
      // Fallback: search by admin email if reset is within expiration window
      admin = await Admin.findOne({
        email: ADMIN_EMAIL,
        resetPasswordExpire: { $gt: Date.now() },
      });
    }

    if (!admin) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save();

    res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// Get Admin Profile Details
export const getAdminProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        email: ADMIN_EMAIL,
        companyName: "MoveO Health",
        logo: "/img/moveO_logo.png",
        welcomeMessage: "Welcome Admin",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
