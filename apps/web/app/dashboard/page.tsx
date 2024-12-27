import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const session = await getSession();
  if (!session || !session?.user) redirect('/auth/signin');

  console.log("Session---> ", session);

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard;