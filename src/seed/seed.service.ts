import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from 'src/common/httpAdapter/axios.adapter';

@Injectable()
export class SeedService {


  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly httpAdapter: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({})

    const data = await this.httpAdapter.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=65')

    const pokemonsToInsert = data.results.map((pokemon) => {
      const segments = pokemon.url.split('/')

      const no = segments[segments.length - 2]
      const name = pokemon.name

      return { no, name }
    })

    await this.pokemonModel.insertMany(pokemonsToInsert)
    return 'Seed executed'
  }

}
