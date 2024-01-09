import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) { }

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll({ page = 1, limit = this.configService.get('defaultLimit') }: { page?: number, limit?: number }) {
    return this.pokemonModel.find().limit(limit).skip((page - 1) * limit);
  }

  async findOne(searchTerm: string) {
    let pokemon: Pokemon = null;

    if (!isNaN(+searchTerm)) {
      pokemon = await this.pokemonModel.findOne({ no: searchTerm });
    }

    if (!pokemon && isValidObjectId(searchTerm)) {
      pokemon = await this.pokemonModel.findById(searchTerm);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: searchTerm });
    }

    if (!pokemon) {
      throw new BadRequestException(`Pokemon with value ${searchTerm} does not exist`);
    }


    return pokemon;
  }

  async update(searchTerm: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(searchTerm);

      if (!pokemon) {
        throw new BadRequestException(`Pokemon with value ${searchTerm} does not exist`);
      }

      const updatedPokemon = await this.pokemonModel.findOneAndUpdate({ _id: pokemon._id }, updatePokemonDto, { new: true })

      return updatedPokemon
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {

    // const pokemon = await this.findOne(id);

    // await pokemon.deleteOne();

    const result = await this.pokemonModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id ${id} does not exist`);
    }

    return result;
  }

  private handleExceptions(error: any) {
    console.log(error)
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon with value ${JSON.stringify(error.keyValue)} already exists`);
    }
    throw new InternalServerErrorException('Check server logs for more information');
  }
}
