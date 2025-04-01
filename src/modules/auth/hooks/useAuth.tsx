import { createContext, ReactNode, useState, useEffect, useContext } from "react";

interface UserData {
  "_id": string,
  "email": string,
  "user_name": string,
  "role_code": string,
  "is_verified": boolean,
  "verification_token": string,
  "verification_token_expires": string,
  "token_version": number,
  "is_blocked": boolean,
  "created_at": string,
  "updated_at": string,
  "is_deleted": boolean,
  "__v": number
}

interface AuthContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};