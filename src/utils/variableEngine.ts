/**
 * Message Variable Engine
 * Priorities: Event Payload > Lead > Product > Product Variant
 */

export interface VariableData {
  payload?: Record<string, any>;
  lead?: Record<string, any>;
  product?: Record<string, any>;
  variant?: Record<string, any>;
}

export function replaceVariables(template: string, data: VariableData): string {
  // Construct the mapping based on priorities
  // Right-most overrides left-most in Object.assign
  const mapping: Record<string, any> = {
    ...data.variant,
    ...data.product,
    ...data.lead,
    ...data.payload,
  };

  // Replace {{variable}} with value
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return mapping[trimmedKey] !== undefined ? String(mapping[trimmedKey]) : match;
  });
}

/**
 * Example usage:
 * replaceVariables("Hello {{name}}, your {{product_name}} is ready.", {
 *   lead: { name: "John" },
 *   product: { product_name: "Course A" }
 * }) 
 * => "Hello John, your Course A is ready."
 */
