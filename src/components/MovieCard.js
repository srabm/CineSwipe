import React from 'react';
import { useSpring, animated } from 'react-spring'; //for animation
import { useDrag } from '@use-gesture/react';
import { FaDoorOpen } from "react-icons/fa";  // Import the door icon from react-icons

const MovieCard = ({ movie, onSwipe }) => {
  const [style, api] = useSpring(() => ({ x: 0, y: 0 }));

  //swiping
  const bind = useDrag(
    (state) => {
      api.start({ x: state.offset[0], y: state.offset[1] });
    },
    { filterTaps: true }
  );

  //TO DO -  CHANGE BUTTONS
  return (
    <animated.div
      className="movie-card"
      style={{ transform: style.x.to((x) => `translateX(${x}px)`) }}
      {...bind()}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
      />
      <h3>{movie.title}</h3>
      <p>{movie.overview}</p>
      <div className="movie-actions">
        <button onClick={() => onSwipe('dislike')}>👎 Dislike</button>
          <button onClick={() => onSwipe('like')}>👍 Like</button> 
      </div>
    </animated.div>
  );
};

export default MovieCard;
