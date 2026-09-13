import Contact from "../models/Contact.js";
import Consultation from "../models/Consultation.js";
import Career from "../models/Career.js";

// --- Contact Form ---
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    const newContact = await Contact.create({ name, email, phone, service, message });
    res.status(201).json({ success: true, message: "Contact inquiry submitted successfully!", data: newContact });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to submit contact form" });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch contacts" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.json({ success: true, message: "Contact inquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete contact inquiry" });
  }
};

// --- Consultation Form ---
export const submitConsultation = async (req, res) => {
  try {
    const { fullName, email, phone, date, time, notes } = req.body;
    const newConsultation = await Consultation.create({ fullName, email, phone, date, time, notes });
    res.status(201).json({ success: true, message: "Consultation booked successfully!", data: newConsultation });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to book consultation" });
  }
};

export const getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch consultations" });
  }
};

export const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    await Consultation.findByIdAndDelete(id);
    res.json({ success: true, message: "Consultation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete consultation" });
  }
};

// --- Career Form ---
export const submitCareer = async (req, res) => {
  try {
    const { name, email, phone, role, experience, resumeLink, coverLetter } = req.body;
    let finalResumeUrl = resumeLink;

    if (req.file) {
      finalResumeUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const newCareer = await Career.create({
      name,
      email,
      phone,
      role,
      experience,
      resumeLink: finalResumeUrl,
      coverLetter,
    });

    res.status(201).json({ success: true, message: "Career application submitted successfully!", data: newCareer });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to submit career application" });
  }
};

export const getCareers = async (req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });
    res.json({ success: true, data: careers });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch career applications" });
  }
};

export const deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;
    await Career.findByIdAndDelete(id);
    res.json({ success: true, message: "Career application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete career application" });
  }
};
