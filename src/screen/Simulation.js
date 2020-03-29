import React from 'react';
import sim from '../simulation/sim';

class Simulation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sim: sim()
    }
  }

  rows() {
    const { grocery_trips } = this.state.sim;
    const rows = grocery_trips.map((v,i) => {
      return(
        <tr key={'trips-' + i}>
          <td>{ i + 1 }</td>
          <td>{ v.visits }</td>
          <td>{ v.rolls }</td>
          <td>{ v.store_state }</td>
        </tr>
      );
    });
    return (
      <tbody>
        { rows }
      </tbody>
    )
  }

  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Trips</th>
            <th>Rolls Sold</th>
            <th>Store State</th>
          </tr>
        </thead>
        { this.rows() }
      </table>
    )
  }
}

export default Simulation;