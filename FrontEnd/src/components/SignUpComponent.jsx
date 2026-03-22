import GenericFormComponent from "./GenericFormComponent";
import { useNavigate } from "react-router";

// ❌ BAD: Direct DB client import in frontend
import db from "../db/client";  

export default function SignUpComponent() {
  const navigate = useNavigate();

  const handlSignUp = async (formData) => {
    try {
      // ❌ BAD: Direct database call from frontend
      const result = await db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [formData.username, formData.email, formData.password]
      );

      console.log("User inserted:", result);

      navigate("/dashboard");
      
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  const formConfig = {
    meta: {
      title: "Sign Up",
      subtitle: "Register to ParkRabbit. Fast and Easy Parking",
    },

    fields: [
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        placeholder: "Enter your username",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "Enter your email",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        placeholder: "••••••••",
      },
    ],

    actions: {
      submit: {
        show: true,
        text: "Sign Up",
        variant: "contained",
        style: "primary",
        type: "submit",
        onSubmit: handlSignUp,
      },
    },
  };

  return <GenericFormComponent config={formConfig} />;
}