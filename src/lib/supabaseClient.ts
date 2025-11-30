// Simple mock supabase client for development
// Replace with actual Supabase configuration in production

export const supabase = {
  from: (table: string) => ({
    update: (data: any) => ({
      eq: (column: string, value: any) => {
        console.log(`📊 Mock Supabase: UPDATE ${table} SET`, data, `WHERE ${column} =`, value);
        return Promise.resolve({ data: null, error: null });
      }
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => {
          console.log(`📊 Mock Supabase: INSERT INTO ${table}`, data);
          // Return mock data with generated ID
          const mockData = Array.isArray(data) ? { ...data[0], id: 'mock-' + Date.now() } : { ...data, id: 'mock-' + Date.now() };
          return Promise.resolve({ data: mockData, error: null });
        }
      }),
      // For inserts without select
      then: (resolve: any) => {
        console.log(`📊 Mock Supabase: INSERT INTO ${table}`, data);
        return Promise.resolve({ data: null, error: null }).then(resolve);
      }
    }),
    upsert: (data: any, options?: any) => {
      console.log(`📊 Mock Supabase: UPSERT INTO ${table}`, data, options);
      return Promise.resolve({ data: null, error: null });
    },
    select: (columns = '*') => ({
      eq: (column: string, value: any) => ({
        single: () => {
          console.log(`📊 Mock Supabase: SELECT ${columns} FROM ${table} WHERE ${column} =`, value, 'SINGLE');
          // Return null data with PGRST116 error to simulate "not found"
          return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'Not found' } });
        }
      }),
      order: (column: string, options: any) => ({
        limit: (count: number) => {
          console.log(`📊 Mock Supabase: SELECT ${columns} FROM ${table} ORDER BY ${column} LIMIT ${count}`);
          return Promise.resolve({ data: [], error: null });
        }
      })
    })
  })
};
