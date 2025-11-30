import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    email = email.trim().toLowerCase();

    const existing = await AsyncStorage.getItem("users");
    let users = existing ? JSON.parse(existing) : [];

    console.log("Login attempt:", email, password);
    console.log("Stored users:", users);


    const found = users.find(
      u => u.email === email && u.password === password
    );

    console.log("found email:", found);

    if (!found) return { error: "Incorrect email or password" };

    setUser(found);
    await AsyncStorage.setItem("user", JSON.stringify(found));

    return { success: true };

    // if (!email || !password) return { error: "Please fill in all fields" };
    // if (email !== "test@example.com" || password !== "123456") {
    //   return { error: "Incorrect email or password" };
    // }
    // const loggedInUser = { name: "John Doe", email };
    // setUser(loggedInUser);
    // await AsyncStorage.setItem("user", JSON.stringify(loggedInUser));
    // return { success: true };

    

  };

  const signup = async (name, email, password) => {
    if (!name || !email || !password) return { error: "All fields are required" };
    if (!email.includes("@")) return { error: "Invalid email format" };
    if (password.length < 6) return { error: "Password must be at least 6 characters" };

    // 1. Load existing users array
    const existing = await AsyncStorage.getItem("users");
    let users = existing ? JSON.parse(existing) : [];

    // 2. Check if email already exists
    if (users.some(u => u.email === email)) {
      return { error: "Email already registered" };
    }

    // 3. Create new user
    const newUser = { name, email, password };

    // 4. Add new user to the array
    users.push(newUser);

    // 5. Save the updated users array
    await AsyncStorage.setItem("users", JSON.stringify(users));

    // 6. Save logged-in user
    setUser(newUser);
    await AsyncStorage.setItem("user", JSON.stringify(newUser));

    return { success: true };
  };


  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
