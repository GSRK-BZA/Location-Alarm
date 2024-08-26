import React from 'react'
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import './login.css'
import { LoginUser } from '../../calls/users';
// import { useAuth } from '../../components/authentication/AuthContext.js';

function Login() {
  const navigate = useNavigate()
//   const { login } = useAuth();
  const onFinish = async (values) => {
    console.log(values);
    try {
      const response = await LoginUser(values);
      console.log(response); // Debug the response
      if (response.success) {
        message.success(response.message);
        // login(response.token);
        localStorage.setItem('token', response.token);
        navigate('/');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error(error); // Debug the error
      message.error('An unexpected error occurred');
    }
  };

  return (
    <>
      <header className="App-header">
        <main className="main-area mw-500 text-center px-3">
          <section className="left-section">
            <h1>Login</h1>
          </section>

          <section className="right-section">
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="UserName"
                htmlFor="username"
                name="username"
                className="d-block"
                rules={[{ required: true, message: "User name is required" }]}
              >
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                ></Input>
              </Form.Item>

              <Form.Item
                label="Password"
                htmlFor="password"
                name="password"
                className="d-block"
                rules={[{ required: true, message: "Password is required" }]}
              >
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your Password"
                ></Input>
              </Form.Item>

              <Form.Item className="d-block">
                <Button
                  type="primary"
                  block
                  htmlType="submit"
                  style={{ fontSize: "1rem", fontWeight: "600" }}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
            <div>
              <p>
                New User? <Link to="/register" className='link'>Register Here</Link>
              </p>
            </div>
          </section>
        </main>
      </header>
    </>
  )
}

export default Login