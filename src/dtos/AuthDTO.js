//create auth dto
class AuthDTO {
  constructor(auth) {
    this._id = auth?._id || null;
    this.fullName = auth?.fullName || "";
    this.email = auth?.email || "";
    this.role = auth?.role || "";
  }
}

module.exports = { AuthDTO };
