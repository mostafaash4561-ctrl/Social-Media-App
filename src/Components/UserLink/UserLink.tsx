import { useContext, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext/AuthContext";

type LinkedUser = {
  _id: string;
  name?: string;
  username?: string;
  photo?: string;
};


export default function UserLink({
  user,
  className,
  label,
  onClick,
  children,
}: {
  user: LinkedUser | null | undefined;
  className?: string;
  label?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const { userId } = useContext(AuthContext);

  if (!user?._id) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      to={user._id === userId ? "/profile" : `/users/${user._id}`}
      state={{ user }}
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {children}
    </Link>
  );
}
