import { gql } from "@apollo/client";

//export const gql = String.raw;
///* GraphQL */ tagged template literal strings
export const REGISTER_USER = gql`
  mutation RegisterUser(
    $username: String!
    $password: String!
    $email: String!
  ) {
    registerUser(username: $username, password: $password, email: $email) {
      _id
      username
      email
      isVerified
      profileUrl
      phoneNumber
      newEmail
    }
  }
`;

export const RESEND_VERIFY_EMAIL = gql`
  mutation ResendVerifyEmail {
    resendVerifyEmail {
      message
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $username: String
    $email: String
    $password: String
    $phoneNumber: String
    $newPassword: String
    $profileUrl: String
  ) {
    updateUser(
      id: $id
      username: $username
      email: $email
      password: $password
      phoneNumber: $phoneNumber
      newPassword: $newPassword
      profileUrl: $profileUrl
    ) {
      _id
      username
      email 
      isVerified
      profileUrl
      phoneNumber
      newEmail
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      _id
      username
      email
      isVerified
      profileUrl
      phoneNumber
      newEmail
    }
  }
`;
