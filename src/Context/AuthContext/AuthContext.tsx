import { jwtDecode } from "jwt-decode";
import { createContext, useMemo, useState, type ReactNode } from "react";
type AuthContextType = {
  userLogin: string | null;
  setuserLogin: React.Dispatch<React.SetStateAction<string | null>>;
  userId: string;
};

export const AuthContext = createContext<AuthContextType>({
  userLogin: null,
  setuserLogin: () => {},
  userId: "",
});

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [userLogin, setuserLogin] = useState(() =>
    localStorage.getItem("userToken"),
  );

  const userId = useMemo(() => {
    if (!userLogin) return "";
    try {
      return jwtDecode<{ user: string }>(userLogin).user ?? "";
    } catch {
      return "";
    }
  }, [userLogin]);

  return (
    <AuthContext.Provider value={{ userLogin, setuserLogin, userId }}>
      {children}
    </AuthContext.Provider>
  );
}
