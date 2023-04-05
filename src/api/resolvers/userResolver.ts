// TODO: add resolver for user
// Query: users, userById, checkToken
// Mutation: login, register, updateUser, deleteUser

import {GraphQLError} from 'graphql';
import { Animal } from '../../interfaces/Animal';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';
import {User, UserIdWithToken} from '../../interfaces/User';

export default {
  Animal: {
    owner: async (parent: Animal) => {
      const response = await fetch(`${process.env.AUTH_URL}/users/${parent.owner}`);
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const user = await response.json() as User[];
      return user;
    }
  },
  Query: {
    users: async () => {
      const response = await fetch(`${process.env.AUTH_URL}/users`);
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const users = await response.json();
      return users;
    },
    userById: async (_parent: unknown, args: {id: string}) => {
      const response = await fetch(`${process.env.AUTH_URL}/users/${args.id}`);
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const user = await response.json() as User[];
      return user;
    },
    checkToken: async (
      _parent: unknown,
      _args: unknown,
      user: UserIdWithToken
    ) => {
      console.log(user);

      const response = await fetch(`${process.env.AUTH_URL}/users/token`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const userFromAuth = await response.json();
      return userFromAuth;
    },
  },
  Mutation: {
    login: async (
      _parent: unknown,
      args: {username: string; password: string}
    ) => {
      const response = await fetch(`${process.env.AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const user = (await response.json()) as LoginMessageResponse;
      return user;
    },
    register: async (_parent: unknown, args: User) => {
      const response = await fetch(`${process.env.AUTH_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'VALIDATION_ERROR'},
        });
      }
      const user = (await response.json()) as LoginMessageResponse;
      return user;
    },
    updateUser: async (_parent: unknown, args: User, user: UserIdWithToken) => {
      const response = await fetch(`${process.env.AUTH_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${args.token}`,
        },
        body: JSON.stringify(args),
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const userFromPut = (await response.json()) as LoginMessageResponse;
      return userFromPut;
    },
    deleteUser: async (
      _parent: unknown,
      _args: unknown,
      user: UserIdWithToken
    ) => {
      const response = await fetch(`${process.env.AUTH_URL}/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const userFromDelete = (await response.json()) as LoginMessageResponse;
      return userFromDelete;
    },
  },
};
