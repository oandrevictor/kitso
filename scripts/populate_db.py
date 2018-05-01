# coding: utf-8
from imdb import IMDb
import requests


"""
    To run this scripts, you will need to install imdb package and run with python 3.
    To install imdb package, you can do `python3 -m pip install --user git+https://github.com/alberanid/imdbpy`
    To run with python 3, you can do `python3 populate_db.py`.
"""


imdb_interface = IMDb()
MOVIE_URL = 'http://localhost:8080/api/movie/'
PERSON_URL = 'http://localhost:8080/api/person/'
film_per_person = dict()
cast_per_film = dict()
person_dict = dict()
filme_db_id = dict()
top250 = imdb_interface.get_top250_movies()
top250 = top250[:1]


class Person(object):

    def __init__(self, imdbid, db_id, name, birth_date, filmography, is_director):
        self.imdbid = imdbid
        self.db_id = db_id
        self.name = name
        self.birth_date = birth_date
        self.filmography = filmography
        self.is_director = is_director

def create_person_json(name, description, birthday, filmography_list):
    return {
        "name": name,
        "description": description,
        "birthday": birthday,
        "appears_in": filmography_list
    }

def create_movie_json(imdb_id, movie, cast, directors):
    return {
        "name": movie.get('title'),
        "imdb_id": imdb_id,
        "release_date": movie.get('year'),
        "overview": movie.get('plot')[0],
        "rating": movie.get('rating'),
        "genres": movie.get('genres'),
        "poster": movie.get('cover url'),
        "actors": cast,
        "directors": directors
    }

def get_cast_db_ids(cast):
    name_list = list(map(str, cast))
    cast_ids = []
    for name in name_list:
        m_id = person_dict[name].db_id
        cast_ids.append(m_id)
    return cast_ids

def fix_birthday_date(str_date):
    NO_BIRTHDAY_DATE_PROVIDED = ""

    if str_date == None:
        return NO_BIRTHDAY_DATE_PROVIDED

    list_date = str_date.split("-")
    for i in range(len(list_date)):
        if list_date[i] == "0":
            list_date[i] = "1"

    return "-".join(list_date)

def get_movies_db_ids(movies):
    movies_ids = []
    for movie in movies:
        movie_name = movie.get('title')
        if movie_name in filme_db_id:
            db_id = filme_db_id[movie_name]
            movies_ids.append(db_id)
    return movies_ids


for m in top250:

    movie = imdb_interface.get_movie(m.movieID)
    movie_cast = movie.get('cast')[:4]
    cast_per_film[m.movieID] = movie_cast

    for p in movie_cast:

        person_imdb = imdb_interface.get_person(p.personID)
        name = person_imdb.get('name')
        birth_date = fix_birthday_date(person_imdb.get('birth date'))
        filmography = person_imdb.get('filmography')[0]['actor']

        request_json = create_person_json(name, "This is a default description of movie", birth_date, [])
        r = requests.post(PERSON_URL, data=request_json)
        response_json = r.json()
        db_id = response_json['data']['personId']

        person_obj = Person(p.personID, db_id, name, birth_date, filmography, False)
        person_dict[name] = person_obj

for m in top250:

    movie = imdb_interface.get_movie(m.movieID)
    movie_cast = cast_per_film[m.movieID]
    movie_cast_id = get_cast_db_ids(movie_cast)
    directors = movie.get('director')

    request_json = create_movie_json(m.movieID, movie, movie_cast_id, [])
    r = requests.post(MOVIE_URL, data=request_json)
    response_json = r.json()
    db_id = response_json['data']['movieId']
    filme_db_id[str(m)] = db_id


for person_obj in person_dict.values():

    name = person_obj.name
    birth_date = person_obj.birth_date        
    movies_db_ids = get_movies_db_ids(person_obj.filmography)
    request_json = create_person_json(name, "This is a default description of movie", birth_date, movies_db_ids)
    url = PERSON_URL + person_obj.db_id
    r = requests.put(url, data=request_json)
