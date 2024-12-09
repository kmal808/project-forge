import PocketBase from 'pocketbase'

// Initialize PocketBase client
export const pb = new PocketBase('process.env.POCKETBASE_URL')

// Helper to check if user is authenticated
export const isAuthenticated = () => pb.authStore.isValid

// Get current user data
export const getCurrentUser = () => pb.authStore.model

// Authentication functions
export const authHelpers = {
  async login(email: string, password: string) {
    return await pb.collection('users').authWithPassword(email, password)
  },

  async register(email: string, password: string, passwordConfirm: string) {
    return await pb.collection('users').create({
      email,
      password,
      passwordConfirm,
    })
  },

  async logout() {
    pb.authStore.clear()
  },
}

// Collection helpers
export const collections = {
  inventory: pb.collection('inventory'),
  crews: pb.collection('crews'),
  payroll: pb.collection('payroll'),
  materials: pb.collection('materials'),
}

// Error handling wrapper
export async function pbRequest<T>(
  request: Promise<T>,
  errorMessage = 'An error occurred'
): Promise<T> {
  try {
    return await request
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${errorMessage}: ${error.message}`)
    }
    throw new Error(errorMessage)
  }
}
