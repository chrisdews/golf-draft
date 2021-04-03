import React from 'react';
import PropTypes from 'prop-types';


function Header({tournamentInfo}) {

    return (
        <>
        <h1>{tournamentInfo.name}</h1>
        <div>
           {tournamentInfo.course}
        </div>
        <div>
            {tournamentInfo.country}
        </div>
        </>
    );
};


Header.propTypes = {

};


export default Header;
