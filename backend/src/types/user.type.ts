import {z} from 'zod';

export const userType = z.object({
     email: z.string().trim().email().min(4, 'user name is required'),
     password: z.string().trim().min(5, 'password is too short')
})