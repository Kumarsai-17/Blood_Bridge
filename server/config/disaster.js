let DISASTER_MODE = false;

module.exports = {
  get disasterMode() {
    return DISASTER_MODE;
  },

  set disasterMode(value) {
    DISASTER_MODE = value;
  },

  enable() {
    DISASTER_MODE = true;
  },

  disable() {
    DISASTER_MODE = false;
  },

  isEnabled() {
    return DISASTER_MODE;
  },

  // backward-safe alias
  isActive() {
    return DISASTER_MODE;
  }
};
