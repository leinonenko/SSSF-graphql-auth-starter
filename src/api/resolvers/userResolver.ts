import {GraphQLError} from 'graphql';
// TODO: add resolver for user
// Query: users, userById, checkToken
// Mutation: login, register, updateUser, deleteUser

import fetch from 'node-fetch';
import {User} from '../../interfaces/User';

export default {
  Query: {
    // users
    users: async () => {
      const response = await fetch(process.env.AUTH_URL + '/users');
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const users = await response.json();
      return users;
    },
    // userById
    userById: async (_: any, args: {id: string}) => {
      const response = await fetch(process.env.AUTH_URL + '/users/' + args.id);
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const user = await response.json();
      return user;
    },
    // checkToken
    checkToken: async (_parent: unknown, _args: unknown, user: User) => {
      const response = await fetch(process.env.AUTH_URL + '/token', {
        headers: {
          Authorization: 'Bearer ' + user.token,
        },
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const userFromAuth = await response.json();
      return user;
    },
  },
};
