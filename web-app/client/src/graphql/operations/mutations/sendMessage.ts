import { gql } from '@apollo/client';

export const SEND_MESSAGE = gql`
  mutation sendMessage($userIDs: [ID!], $messageData: MessageData!) {
    sendMessage(userIDs: $userIDs, messageData: $messageData) {
      status
      accepted
      rejected
    }
  }
`;
