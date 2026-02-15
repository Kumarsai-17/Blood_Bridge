const BloodInventory = require("../models/BloodInventory");
const User = require("../models/User");

/**
 * Get blood bank inventory summary
 */
exports.getInventorySummary = async (bloodBankId) => {
  try {
    const inventory = await BloodInventory.find({ bloodBank: bloodBankId });
    
    const summary = {
      totalUnits: 0,
      lowStockItems: 0,
      bloodTypes: {}
    };

    inventory.forEach(item => {
      summary.totalUnits += item.unitsAvailable;
      summary.bloodTypes[item.bloodGroup] = item.unitsAvailable;
      
      if (item.unitsAvailable < 5) {
        summary.lowStockItems++;
      }
    });

    return summary;
  } catch (error) {
    console.error("INVENTORY SUMMARY ERROR:", error);
    throw error;
  }
};

/**
 * Check if blood bank has sufficient stock
 */
exports.checkAvailability = async (bloodBankId, bloodGroup, unitsNeeded) => {
  try {
    const inventory = await BloodInventory.findOne({
      bloodBank: bloodBankId,
      bloodGroup
    });

    if (!inventory) {
      return { available: false, currentStock: 0 };
    }

    return {
      available: inventory.unitsAvailable >= unitsNeeded,
      currentStock: inventory.unitsAvailable
    };
  } catch (error) {
    console.error("CHECK AVAILABILITY ERROR:", error);
    throw error;
  }
};

/**
 * Update inventory after fulfilling request
 */
exports.updateAfterFulfillment = async (bloodBankId, bloodGroup, unitsUsed) => {
  try {
    const inventory = await BloodInventory.findOne({
      bloodBank: bloodBankId,
      bloodGroup
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    if (inventory.unitsAvailable < unitsUsed) {
      throw new Error("Insufficient stock");
    }

    inventory.unitsAvailable -= unitsUsed;
    await inventory.save();

    return inventory;
  } catch (error) {
    console.error("UPDATE AFTER FULFILLMENT ERROR:", error);
    throw error;
  }
};

/**
 * Get low stock alerts
 */
exports.getLowStockAlerts = async (bloodBankId, threshold = 5) => {
  try {
    const lowStockItems = await BloodInventory.find({
      bloodBank: bloodBankId,
      unitsAvailable: { $lt: threshold }
    });

    return lowStockItems;
  } catch (error) {
    console.error("LOW STOCK ALERTS ERROR:", error);
    throw error;
  }
};
