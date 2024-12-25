import { getProfile } from "@/lib/actions";

const ProfilePage = async () => {
  const res = await getProfile();

  return (
    <div>
      Profile Page
      <p>{JSON.stringify(res)}</p>
    </div>
  )
}

export default ProfilePage;