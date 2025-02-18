import React, { useState } from "react";

import logo from "./logo.svg";
import "./App.css";

import apiData from "./demoData.json";

function App() {
  // Initial data state
  const [theData, setTheData] = useState(apiData);

  // State to track the selected field and its value for editing
  const [selectedField, setSelectedField] = useState("");
  const [fieldValue, setFieldValue] = useState("");

  // --------------------------------------------------------------------------------------------------

  // recursive spread operator
  function updateNestedObjectUsingSpread(data, keyPath, newValue) {
    // Split the key path into an array of keys
    const keys = keyPath.split(".");

    // Create a recursive function to update the object
    const updateRecursive = (obj, keys, value) => {
      const key = keys[0];

      if (keys.length === 1) {
        // If it's the last key, set the new value
        return { ...obj, [key]: value };
      } else {
        // If not the last key, recurse deeper
        if (!obj[key] || typeof obj[key] !== "object") {
          throw new Error(`Path not found: ${key}`);
        }
        return {
          ...obj,
          [key]: updateRecursive(obj[key], keys.slice(1), value),
        };
      }
    };

    // Call the recursive update function starting from the root
    return updateRecursive(data, keys, newValue);
  }

  // --------------------------------------------------------------------------------------------------

  // recursive function call
  function updateNestedObject(data, keyPath, newValue) {
    // Split the key path into an array of keys
    const keys = keyPath.split(".");

    // Helper function to recursively update the data
    function update(obj, keys, value) {
      const key = keys[0];

      // If we've reached the last key, update the value
      if (keys.length === 1) {
        obj[key] = value;
        return;
      }

      // If the key doesn't exist or isn't an object, initialize it
      if (!obj[key] || typeof obj[key] !== "object") {
        obj[key] = {};
      }

      // Recur with the rest of the keys
      update(obj[key], keys.slice(1), value);
    }

    // Create a deep copy of the data to avoid directly mutating the input
    const dataCopy = JSON.parse(JSON.stringify(data));

    // Call update on the copied data
    update(dataCopy, keys, newValue);

    // Return the updated data
    return dataCopy;
  }

  // --------------------------------------------------------------------------------------------------

  // Generate a flat list of key paths from the data object [ 2 LVL DEEP ]
  const getAllPathsOneLevel = (obj, prefix = "") => {
    return Object.keys(obj).reduce((res, el) => {
      if (
        typeof obj[el] === "object" &&
        obj[el] !== null &&
        !Array.isArray(obj[el])
      ) {
        res = res.concat(getAllPaths(obj[el], prefix + el + "."));
      } else {
        res.push(prefix + el);
      }
      return res;
    }, []);
  };

  // Generate a flat list of key paths from the data object
  const getAllPaths = (obj, prefix = "") => {
    if (typeof obj === "object" && obj !== null) {
      return Object.keys(obj).reduce((paths, key) => {
        const value = obj[key];
        const fullPath = prefix + key;

        if (typeof value === "object" && value !== null) {
          // Recursively call getAllPaths if it's an object (including arrays)
          const deepPaths = getAllPaths(value, fullPath + ".");
          return paths.concat(deepPaths);
        } else {
          // It's a leaf node
          return paths.concat([fullPath]);
        }
      }, []);
    }
    return [];
  };

  // --------------------------------------------------------------------------------------------------

  // checkbox handler - parents are on same level
  const handleCheckboxALLSAME = (parentKey) => {
    setTheData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData)); // deep copy to prevent mutation
      // Reset all enabled values
      Object.keys(newData).forEach((key) => {
        if (newData[key].config) {
          newData[key].config.enabled = false; // reset config enabled
        } else {
          newData[key].enabled = false; // reset directly enabled
        }
      });

      // Set the specific parent's enabled to true based on its structure
      if (newData[parentKey].config) {
        newData[parentKey].config.enabled = true;
      } else {
        newData[parentKey].enabled = true;
      }

      // Implement logic for disabling and enabling specific parents
      switch (parentKey) {
        case "parent1":
          break;
        case "parent2":
          newData["parent4"].enabled = prevData["parent4"].enabled; // retain the state of parent4
          break;
        case "parent3":
          newData["parent4"].enabled = prevData["parent4"].enabled; // retain the state of parent4
          break;
        case "parent4":
          newData["parent2"].config.enabled =
            prevData["parent2"].config.enabled; // retain the state of parent2
          newData["parent3"].config.enabled =
            prevData["parent3"].config.enabled; // retain the state of parent3
          break;
        case "parent5":
          break;
        default:
          break;
      }

      return newData;
    });
  };

  // --------------------------------------------------------------------------------------------------

  const handleCheckbox = (parentKey, isDemoChild = false) => {
    setTheData((prevData) => {
      // Create a deep copy of prevData to ensure immutability
      const newData = JSON.parse(JSON.stringify(prevData));

      console.log(newData);

      // Toggle the 'enabled' state of the targeted checkbox
      if (isDemoChild) {
        newData.demo[parentKey].config.enabled =
          !newData.demo[parentKey].config.enabled;
      } else {
        newData[parentKey].enabled = !newData[parentKey].enabled;
      }

      // Implement the special rules for enabling/disabling checkboxes
      if (parentKey === "parent1" && isDemoChild) {
        Object.keys(newData.demo).forEach((key) => {
          if (key !== "parent1") newData.demo[key].config.enabled = false;
        });
        newData.parent4.enabled = false;
      } else if (
        (parentKey === "parent2" || parentKey === "parent3") &&
        isDemoChild
      ) {
        // Update parent4's enabled state based on the condition of parent2 and parent3
        newData.parent4.enabled =
          newData.demo["parent2"].config.enabled ||
          newData.demo["parent3"].config.enabled;
      } else if (parentKey === "parent4") {
        // No specific rules affecting other parents when parent4 is toggled
      }

      return newData;
    });
  };

  // --------------------------------------------------------------------------------------------------

  const handleCheckbox33 = (parentKey, isDemoChild = false) => {
    setTheData((prevData) => {
      // Ensure we create a completely new object with new references for every level of nested data
      const newData = {
        ...prevData,
        demo: {
          ...prevData.demo,
          [parentKey]: isDemoChild
            ? {
                ...prevData.demo[parentKey],
                config: {
                  ...prevData.demo[parentKey].config,
                  enabled: !prevData.demo[parentKey].config.enabled, // Toggle the enabled state
                },
              }
            : prevData.demo[parentKey],
        },
        parent4: {
          ...prevData.parent4, // Copy parent4 data
          enabled:
            parentKey === "parent4"
              ? !prevData.parent4.enabled
              : prevData.parent4.enabled, // Toggle only if it's parent4
        },
      };

      // Special handling rules
      if (parentKey === "parent1" && isDemoChild) {
        Object.keys(newData.demo).forEach((key) => {
          if (key !== "parent1") {
            newData.demo[key] = {
              ...newData.demo[key],
              config: { ...newData.demo[key].config, enabled: false },
            };
          }
        });
        newData.parent4 = { ...newData.parent4, enabled: false };
      } else if (
        (parentKey === "parent2" || parentKey === "parent3") &&
        isDemoChild
      ) {
        newData.parent4.enabled =
          newData.demo["parent2"].config.enabled ||
          newData.demo["parent3"].config.enabled;
      }

      return newData;
    });
  };

  // --------------------------------------------------------------------------------------------------

  const handleCheckboxNEW = (parentKey, isDemoChild = false) => {
    setTheData((prevData) => {
      // Start by cloning prevData to ensure immutability
      const newData = {
        ...prevData,
        demo: {
          ...prevData.demo,
          parent1: {
            ...prevData.demo.parent1,
            config: { ...prevData.demo.parent1.config },
          },
          parent2: {
            ...prevData.demo.parent2,
            config: { ...prevData.demo.parent2.config },
          },
          parent3: {
            ...prevData.demo.parent3,
            config: { ...prevData.demo.parent3.config },
          },
        },
        parent4: { ...prevData.parent4 },
      };

      // Toggle the clicked checkbox
      if (isDemoChild) {
        newData.demo[parentKey].config.enabled =
          !newData.demo[parentKey].config.enabled;
      } else {
        newData[parentKey].enabled = !newData[parentKey].enabled;
      }

      // Apply rules based on which parent was clicked
      switch (parentKey) {
        case "parent1":
          if (newData.demo["parent1"].config.enabled) {
            // Disable all other parents
            Object.keys(newData.demo).forEach((key) => {
              if (key !== "parent1") {
                newData.demo[key].config.enabled = false;
              }
            });
            newData.parent4.enabled = false;
          }
          break;
        case "parent2":
        case "parent3":
          // Disable parent 1 and the other parent (2 or 3)
          newData.demo.parent1.config.enabled = false;
          newData.demo[
            parentKey === "parent2" ? "parent3" : "parent2"
          ].config.enabled = false;
          // Parent 4 can stay enabled or be toggled independently
          break;
        case "parent4":
          // Disable parent 1
          newData.demo.parent1.config.enabled = false;
          // Parents 2 and 3 can stay enabled or be toggled independently
          break;
        default:
          break;
      }

      return newData;
    });
  };

  // --------------------------------------------------------------------------------------------------

  const paths = getAllPaths(theData);

  // Handle selecting a new field from the dropdown
  const handleSelectChange = (e) => {
    const newPath = e.target.value;
    setSelectedField(newPath);

    // Extract value from theData based on the path
    const value = newPath
      .split(".")
      .reduce((acc, part) => acc && acc[part], theData);
    setFieldValue(value);
  };

  // Handle updating the input value
  const handleInputChange = (e) => {
    setFieldValue(e.target.value);
  };

  // Handle the button click to update theData
  const handleUpdateData = () => {
    const newData = updateNestedObject(theData, selectedField, fieldValue);
    setTheData(newData);
  };

  // Handle the button click to update theData
  const handleUpdateDataUsingSpread = () => {
    const newData = updateNestedObjectUsingSpread(
      theData,
      selectedField,
      fieldValue
    );
    setTheData(newData);
  };

  return (
    <div className="App">
      <div>
        <h3>Recursive function: </h3>
        <select value={selectedField} onChange={handleSelectChange}>
          <option value="">Select a field</option>
          {paths.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={fieldValue || ""}
          onChange={handleInputChange}
          disabled={!selectedField}
        />

        <button onClick={handleUpdateData} disabled={!selectedField}>
          Update
        </button>
      </div>
      <div>
        <h3>Using Spread Operator: </h3>
        <select value={selectedField} onChange={handleSelectChange}>
          <option value="">Select a field</option>
          {paths.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={fieldValue || ""}
          onChange={handleInputChange}
          disabled={!selectedField}
        />

        <button onClick={handleUpdateDataUsingSpread} disabled={!selectedField}>
          Update
        </button>
      </div>
      <div>
        <h3>Parent Checkboxes</h3>
        {Object.entries(theData.demo).map(([key, value]) =>
          value && value.config ? ( // Adding check to ensure value and value.config exist
            <div key={key}>
              <label>
                {key.toUpperCase()}:
                <input
                  type="checkbox"
                  checked={value.config.enabled}
                  onChange={() => handleCheckboxNEW(key, true)}
                />
              </label>
            </div>
          ) : null
        )}
        {theData.parent4 ? ( // Check if parent4 exists before rendering
          <div>
            <label>
              PARENT4:
              <input
                type="checkbox"
                checked={theData.parent4.enabled}
                onChange={() => handleCheckboxNEW("parent4")}
              />
            </label>
          </div>
        ) : null}
      </div>
      <div>
        <h3>Current Data:</h3>
        <pre>{JSON.stringify(theData, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
