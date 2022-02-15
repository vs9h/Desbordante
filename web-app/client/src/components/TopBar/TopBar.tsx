import React, { useContext } from "react";
import { Container, Navbar } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import "./TopBar.scss";
import Button from "../Button/Button";
import { TaskContext } from "../TaskContext/TaskContext";
import { AuthContext } from "../AuthContext";

const TopBar = () => {
  const history = useHistory();

  const { fileName, status, resetTask } = useContext(TaskContext)!;
  const { user, setIsSignUpShown, setIsFeedbackShown, setIsLogInShown } =
    useContext(AuthContext)!;

  return (
    <Navbar variant="dark" bg="dark" sticky="top" className="position-relative">
      <Container fluid>
        <Navbar.Brand
          onClick={() => {
            resetTask();
            history.push("/");
          }}
        >
          <img
            src="/icons/logo.svg"
            alt="logo"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />{" "}
          Desbordante
        </Navbar.Brand>
        <Container fluid className="d-flex text-muted ps-0">
          {fileName && (
            <p className="mx-1 my-auto text-secondary">{fileName}</p>
          )}
          {status !== "UNSCHEDULED" && (
            <p className="mx-1 my-auto text-secondary">{status}</p>
          )}
        </Container>
        <Button
          variant="outline-light"
          onClick={() => setIsFeedbackShown(true)}
          className="mx-2"
        >
          Send Feedback
        </Button>
        {!user && (
          <Button
            variant="outline-light"
            onClick={() => setIsLogInShown(true)}
            className="mx-2"
          >
            Log In
          </Button>
        )}
        {!user && (
          <Button onClick={() => setIsSignUpShown(true)} className="mx-2">
            Sign Up
          </Button>
        )}
      </Container>
    </Navbar>
  );
};

export default TopBar;
