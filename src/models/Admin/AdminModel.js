// services/adminService.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateToken } = require("../../services/tokenHandlers/HandleJwt");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const {
  hashPassword,
  comparePasswords,
} = require("../../services/encryptionHandlers/HandleBcrypt");
const {
  AdminLoginDTO,
  AdminRegisterDTO,
  AdminUpdateDTO,
  AdminFetchDTO,
} = require("../../dtos/AdminDTO");

const adminService = {
  // Get all admins
  getAllAdmins: async () => {
    try {
      const admins = await prisma.admin.findMany({
        orderBy: { createdAt: "desc" },
      });

      return admins.map((admin) => new AdminFetchDTO(admin));
    } catch (error) {
      throw new CustomError(500, error.message);
    }
  },

  // Get one admin
  getOneAdmin: async (id) => {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id },
      });

      if (!admin) {
        throw new CustomError(404, "Admin not found");
      }

      return new AdminFetchDTO(admin);
    } catch (error) {
      throw new CustomError(500, error.message);
    }
  },

  // Login
  login: async ({ email, password }) => {
    try {
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        throw new CustomError(404, "Admin not found");
      }

      const passwordMatch = await comparePasswords(password, admin.password);
      if (!passwordMatch) {
        throw new CustomError(401, "Invalid password");
      }

      const token = generateToken(admin.id);
      const adminDTO = new AdminLoginDTO(admin);

      return { ...adminDTO, accessToken: token };
    } catch (error) {
      throw new CustomError(500, error.message);
    }
  },

  // Register
  register: async ({ fullName, email, password }) => {
    try {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
      });

      if (existingAdmin) {
        throw new CustomError(401, "Admin already exists");
      }

      const hashedPassword = await hashPassword(password);
      const newAdmin = await prisma.admin.create({
        data: { fullName, email, password: hashedPassword },
      });

      const token = generateToken(newAdmin.id);
      const adminDTO = new AdminRegisterDTO(newAdmin);

      return { ...adminDTO, accessToken: token };
    } catch (error) {
      throw new CustomError(500, error.message);
    }
  },

  // Update admin by ID
  updateAdminById: async ({ id, updatedData }) => {
    try {
      const updatedAdmin = await prisma.admin.update({
        where: { id },
        data: updatedData,
      });

      return new AdminUpdateDTO(updatedAdmin);
    } catch (error) {
      if (error.code === "P2025") {
        // Prisma error code for "Record to update not found."
        throw new CustomError(404, "Admin not found");
      }
      throw new CustomError(500, error.message);
    }
  },

  // Update password by OTP
  updatePasswordByOTP: async ({ email, otp, newPassword }) => {
    try {
      // Add OTP validation logic here

      const hashedPassword = await hashPassword(newPassword);
      const updatedAdmin = await prisma.admin.update({
        where: { email },
        data: { password: hashedPassword },
      });

      return new AdminUpdateDTO(updatedAdmin);
    } catch (error) {
      if (error.code === "P2025") {
        // Prisma error code for "Record to update not found."
        throw new CustomError(404, "Admin not found");
      }
      throw new CustomError(500, error.message);
    }
  },

  // Update password by email
  updatePasswordByEmail: async ({ email, oldPassword, newPassword }) => {
    try {
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        throw new CustomError(404, "Admin not found");
      }

      const passwordMatch = await comparePasswords(oldPassword, admin.password);
      if (!passwordMatch) {
        throw new CustomError(401, "Invalid password");
      }

      const hashedPassword = await hashPassword(newPassword);
      const updatedAdmin = await prisma.admin.update({
        where: { email },
        data: { password: hashedPassword },
      });

      return new AdminUpdateDTO(updatedAdmin);
    } catch (error) {
      if (error.code === "P2025") {
        // Prisma error code for "Record to update not found."
        throw new CustomError(404, "Admin not found");
      }
      throw new CustomError(500, error.message);
    }
  },

  // Delete admin by ID
  deleteAdminById: async (id) => {
    try {
      const result = await prisma.admin.delete({
        where: { id },
      });

      return { message: `Admin deleted successfully with id: ${id}` };
    } catch (error) {
      if (error.code === "P2025") {
        // Prisma error code for "Record to delete not found."
        throw new CustomError(404, "Admin not found");
      }
      throw new CustomError(500, error.message);
    }
  },
};

module.exports = adminService;
