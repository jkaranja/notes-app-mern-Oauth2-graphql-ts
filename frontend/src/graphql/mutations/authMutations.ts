import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($verifyToken: String!) {
    verifyEmail(verifyToken: $verifyToken) {
      message
    }
  }
`;

export const OAUTH_SUCCESS = gql`
  mutation OauthSuccess {
    oauthSuccess {
      accessToken
    }
  }
`; 



export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($resetToken: String!, $password: String!) {
    resetPassword(password: $password, resetToken: $resetToken) {
      message
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;
