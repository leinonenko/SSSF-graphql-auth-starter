import {Animal} from '../../interfaces/Animal';
import animalModel from '../models/animalModel';
import rectangleBounds from '../../utils/rectangleBounds';
import {locationInput} from '../../interfaces/Location';
import {UserIdWithToken} from '../../interfaces/User';
import {GraphQLError} from 'graphql';
import {Types} from 'mongoose';

import {io, Socket} from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../interfaces/ISocket';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.SOCKET_URL as string
);

export default {
  Query: {
    animals: async () => {
      return await animalModel.find();
    },
    animalById: async (_parent: undefined, args: Animal) => {
      return await animalModel.findById(args.id);
    },
    animalsByArea: async (_parent: undefined, args: locationInput) => {
      const bounds = rectangleBounds(args.topRight, args.bottomLeft);
      return await animalModel.find({
        location: {
          $geoWithin: {
            $geometry: bounds,
          },
        },
      });
    },
  },
  Mutation: {
    addAnimal: async (
      _parent: undefined,
      args: Animal,
      user: UserIdWithToken
    ) => {
      if (!user.token) {
        throw new GraphQLError('Not authorized', {
          extensions: {code: 'NOT_AUTHORIZED'},
        });
      }
      args.owner = user.id as unknown as Types.ObjectId;
      console.log(args);
      const animal = new animalModel(args);
      const result = await animal.save();
      socket.emit('update', 'animal');
      return result;
    },

    modifyAnimal: async (
      _parent: undefined,
      args: Animal,
      user: UserIdWithToken
    ) => {
      if (!user.token) {
        throw new GraphQLError('Not authorized', {
          extensions: {code: 'NOT_AUTHORIZED'},
        });
      }
      return await animalModel.findByIdAndUpdate(args.id, args, {
        new: true,
      });
    },

    deleteAnimal: async (
      _parent: undefined,
      args: Animal,
      user: UserIdWithToken
    ) => {
      if (!user.token) {
        throw new GraphQLError('Not authorized', {
          extensions: {code: 'NOT_AUTHORIZED'},
        });
      }
      return await animalModel.findByIdAndDelete(args.id);
    },
  },
};
