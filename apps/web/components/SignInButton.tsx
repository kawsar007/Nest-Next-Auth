import { getSession } from '@/lib/session';
import Link from 'next/link';

const SignInButton = async () => {
  const session = await getSession();

  const renderSignInLinks = () => (
    <>
      <Link href={"/auth/signin"}>Sign In</Link>
      <Link href={"/auth/signup"}>Sign Up</Link>
    </>
  );

  const renderSignOutLinks = () => (
    <>
      <p>{session?.user?.name}</p>
      <Link href={"/api/auth/signout"}>Sign Out</Link>
    </>
  );

  return (
    <div className='flex items-center gap-2 ml-auto'>
      {!session || !session.user ? renderSignInLinks() : renderSignOutLinks()}
    </div>
  )
}

export default SignInButton;