import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const token = useAuthStore(s => s.token);
  const role  = useAuthStore(s => s.role);

  if (!token) return <Redirect href="/(auth)/" />;
  if (role === 'driver') return <Redirect href="/(driver)/" />;
  return <Redirect href="/(rider)/" />;
}
