// DTOs/adminDTO.js

class AdminLoginDTO {
  constructor(admin) {
    this._id = admin?._id || null;
    this.fullName = admin?.fullName || "";
    this.email = admin?.email || "";
    this.profileImage = admin?.profileImage || "";
  }
}

class AdminRegisterDTO {
  constructor(admin) {
    this._id = admin?._id || null;
    this.fullName = admin?.fullName;
    this.email = admin?.email;
    this.profileImage = admin?.profileImage || "";
  }
}

class AdminFetchDTO {
  constructor(admin) {
    this._id = admin?._id || null;
    this.fullName = admin?.fullName || "";
    this.email = admin?.email || "";
    this.profileImage = admin?.profileImage || "";
  }
}

class AdminUpdateDTO {
  constructor(admin) {
    this._id = admin?._id || null;
    this.fullName = admin?.fullName || "";
    this.email = admin?.email || "";
    this.profileImage = admin?.profileImage || "";
  }
}

class AdminDeleteDTO {
  constructor(admin) {
    this._id = admin?._id || null;
    this.fullName = admin?.fullName || "";
    this.email = admin?.email || "";
    this.profileImage = admin?.profileImage || "";
  }
}

module.exports = {
  AdminLoginDTO,
  AdminRegisterDTO,
  AdminFetchDTO,
  AdminUpdateDTO,
  AdminDeleteDTO,
};
