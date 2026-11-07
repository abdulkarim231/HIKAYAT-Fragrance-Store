import 'server-only';
import { z } from 'zod';
import { getDb } from '@/lib/db';

/** Password hashes belong exclusively to Supabase Auth, not this profile. */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const rowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.string().datetime({ offset: true }),
});

export const UserModel = {
  /** RLS restricts this request to the token owner's profile. */
  async findCurrent(accessToken: string): Promise<User | null> {
    if (!accessToken) throw new Error('Authentication required.');
    const response = await getDb().request('/rest/v1/users?select=id,name,email,created_at&limit=1', { accessToken });
    if (!response.ok) throw new Error('Profile lookup failed.');
    const [row] = z.array(rowSchema).parse(await response.json());
    return row ? { id: row.id, name: row.name, email: row.email, createdAt: row.created_at } : null;
  },
};
