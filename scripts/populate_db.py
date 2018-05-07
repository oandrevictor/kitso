# coding: utf-8
from imdb import IMDb
import requests
import configparser

"""
    To run this scripts, you will need to install imdb package and run with python 3.
    To install imdb package, you can do `python3 -m pip install --user git+https://github.com/alberanid/imdbpy`
    To run with python 3, you can do `python3 populate_db.py`.
"""

global LIMIT_OF_PEOPLE

imdb_interface = IMDb()
config = configparser.ConfigParser()
config.read('config.ini')

MOVIE_URL = config['DEFAULT']['URL'] + '/api/movie/'
PERSON_URL = config['DEFAULT']['URL'] + '/api/person/'
APPEARSIN_URL = config['DEFAULT']['URL'] + '/api/appears_in/'

print(MOVIE_URL, PERSON_URL, APPEARSIN_URL)
exit 

LIMIT_OF_PEOPLE = 5
cast_per_film = dict()
directors_per_film = dict()
person_dict = dict()
filme_db_id = dict()
top250 = imdb_interface.get_top250_movies()
top50 = top250[:50]


class Person(object):

    def __init__(self, imdbid, db_id, name, birth_date, filmography):
        self.imdbid = imdbid
        self.db_id = db_id
        self.name = name
        self.birth_date = birth_date
        self.filmography = filmography
        self.appears_in_db_ids = []
    
    def add_appearsin(self, appearsin_id):
        self.appears_in_db_ids.append(appearsin_id)
     

def fix_birthday_date(str_date):
    NO_BIRTHDAY_DATE_PROVIDED = ""

    if str_date == None:
        return NO_BIRTHDAY_DATE_PROVIDED

    list_date = str_date.split("-")
    for i in range(len(list_date)):
        if list_date[i] == "0":
            list_date[i] = "1"

    return "-".join(list_date)

def create_person_json(person_imdb):
    birthday = fix_birthday_date(person_imdb.get('birth date'))
    return {
        "name": person_imdb.get('name'),
        "description": "This is a default description of movie",
        "birthday": birthday,
        "_appears_in": []
    }

def create_person_update_json(person_obj):    
    return {
        "name": person_obj.name,
        "description": "This is a default description of person",
        "birthday": person_obj.birth_date ,
        "_appears_in": person_obj.appears_in_db_ids
    }

def create_appearsin_json(person_id, media_id):
    return {
        '_person': person_id,
        '_media': media_id        
    }

def post(url, json, response_data_key):
    r = requests.post(url, data=json)
    response_json = r.json()
    db_id = response_json['data'][response_data_key]    
    return db_id

def create_movie_json(imdb_id, movie, cast, directors):
    return {
        "name": movie.get('title'),
        "imdb_id": imdb_id,
        "release_date": movie.get('year'),
        "overview": movie.get('plot')[0],
        "rating": movie.get('rating'),
        "genres": movie.get('genres'),
        "poster": movie.get('cover url'),
        "_actors": cast,
        "_directors": directors
    }

def get_person_db_ids_list(imdb_person_list, person_dict):
    name_list = list(map(str, imdb_person_list))
    db_ids_list = []
    for name in name_list:
        m_id = person_dict[name].db_id
        db_ids_list.append(m_id)
    return db_ids_list

def get_movies_db_ids(movies):
    movies_ids = []
    for movie in movies:
        movie_name = movie.get('title')
        if movie_name in filme_db_id:
            db_id = filme_db_id[movie_name]
            movies_ids.append(db_id)
    return movies_ids

def get_movie_cast(imdb_id, movie, cast_per_film):
    movie_cast = movie.get('cast')[:LIMIT_OF_PEOPLE]
    cast_per_film[imdb_id] = movie_cast
    return movie_cast

def get_movie_directors(imdb_id, movie, directors_per_film):
    movie_directors = movie.get('director')
    directors_per_film[imdb_id] = movie_directors
    return movie_directors

def create_person_obj(person_imdb, imdbid, db_id, is_actor):
    name = person_imdb.get('name')
    birth_date = fix_birthday_date(person_imdb.get('birth date'))
    filmography_type = list(person_imdb.get('filmography')[0].keys())[0]
    filmography = person_imdb.get('filmography')[0][filmography_type]
    return Person(imdbid, db_id, name, birth_date, filmography)
   
def post_person_imdb_list(imdb_interface, person_imdb_list, PERSON_URL, is_cast):
    for p in person_imdb_list:
        person_imdb = imdb_interface.get_person(p.personID)
        request_json = create_person_json(person_imdb)
        db_id = post(PERSON_URL, request_json, response_data_key='personId')
        person_obj = create_person_obj(person_imdb, p.personID, db_id, is_actor=is_cast)
        person_dict[person_obj.name] = person_obj    
   
def post_create_persons_in_db(imdb_interface, top50, cast_per_film, directors_per_film, person_dict, person_url):
    for m in top50:
        movie = imdb_interface.get_movie(m.movieID)
        movie_cast = get_movie_cast(m.movieID, movie, cast_per_film)
        movie_directors = get_movie_directors(m.movieID, movie, directors_per_film)
        post_person_imdb_list(imdb_interface, movie_cast, person_url, is_cast=True)
        post_person_imdb_list(imdb_interface, movie_directors, person_url, is_cast=False)

def post_create_movie_in_db(imdb_interface, top50, person_dict, movie_url):
    for m in top50:
        movie = imdb_interface.get_movie(m.movieID)
        movie_cast = cast_per_film[m.movieID]
        movie_cast_id = get_person_db_ids_list(movie_cast, person_dict)
        movie_directors = directors_per_film[m.movieID]
        movie_directors_id = get_person_db_ids_list(movie_directors, person_dict)

        request_json = create_movie_json(m.movieID, movie, movie_cast_id, movie_directors_id)
        db_id = post(movie_url, request_json, response_data_key="movieId")
        filme_db_id[str(m)] = db_id

def post_create_appearsin_in_db(person_dict, appearsin_url):
    for person_obj in person_dict.values():
        movies_ids = get_movies_db_ids(person_obj.filmography)
        for movie_id in movies_ids:
            request_json = create_appearsin_json(person_obj.db_id, movie_id)
            appearsin_id = post(appearsin_url, json=request_json, response_data_key="appearsInId")
            person_obj.add_appearsin(appearsin_id)
    
def put_update_persons(person_dict, person_url):
    for person_obj in person_dict.values():
        request_json = create_person_update_json(person_obj)
        url = person_url + person_obj.db_id
        requests.put(url, data=request_json)

post_create_persons_in_db(imdb_interface, top50, cast_per_film, directors_per_film, person_dict, PERSON_URL)
post_create_movie_in_db(imdb_interface, top50, person_dict, MOVIE_URL)
post_create_appearsin_in_db(person_dict, APPEARSIN_URL)
put_update_persons(person_dict, PERSON_URL)