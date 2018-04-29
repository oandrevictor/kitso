# coding: utf-8
from imdb import IMDb
import requests


"""
    To run this scripts, you will need to install imdb package and run with python 3.
    To install imdb package, you can do `python3 -m pip install --user git+https://github.com/alberanid/imdbpy`
    To run with python 3, you can do `python3 populate_db.py`.
"""


imdb_interface = IMDb()
POST_CREATE_MOVIE_URL = 'http://localhost:8080/api/movie/'

top250 = imdb_interface.get_top250_movies()
for m in top250:    
    movie = imdb_interface.get_movie(m.movieID)    
    # cast = []
    # for person in movie.get('cast'):
    #     cast.append(person.get('name'))   
    json_data = {
        "name": movie.get('title'),
        "imdb_id": m.movieID,
        "release_date": movie.get('year'),
        "overview": movie.get('plot'),
        "rating": movie.get('rating'),
        "genres": movie.get('genres'),
        "poster": movie.get('cover url'),
        # "actors": cast,
        # "directors": movie.get('director')
    }
    requests.post(POST_CREATE_MOVIE_URL, data=json_data)
