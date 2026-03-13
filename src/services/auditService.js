import { supabase } from '@/lib/supabaseClient';

export const auditPricingDatabase = async () => {
  console.log("=== INITIATING DATABASE AUDIT ===");
  try {
    const { data, error } = await supabase.rpc('get_schema_info');
    
    if (error) {
      console.error("Audit failed:", error);
      return { success: false, error };
    }

    console.log("=== SCHEMA REPORT ===");
    data.forEach(table => {
      console.log(`\nTable: ${table.table_name}`);
      console.table(table.columns);
    });
    console.log("\n=== AUDIT COMPLETE ===");
    
    return { success: true, data };
  } catch (err) {
    console.error("Audit Exception:", err);
    return { success: false, error: err.message };
  }
};