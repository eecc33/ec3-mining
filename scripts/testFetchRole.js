
import { Sdk } from "@peaq-network/sdk";

/**
 * Fetches role information from the peaq network's RBAC system.
 * @param {string} ownerAddress - The address of the owner of the role.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of object containing fetched role details.
 */
const fetchRole = async (ownerAddress) => {
  const sdkInstance = await Sdk.createInstance({
    baseUrl: "wss://wsspc1-qa.agung.peaq.network",
  });
  console.log("---init sdk---");
  try {
    const roles = await sdkInstance.rbac.fetchRoles(
      "..."
    );
    console.log("----roles----");

    return roles;
  } finally {
    await sdkInstance.disconnect();
  }
};

// Example usage
const ownerAddress = "...";

fetchRole(ownerAddress)
  .then((roles) => {
    console.log("Fetched Roles:", roles);
  })
  .catch((error) => {
    console.error("Error fetching roles:", error);
  });
