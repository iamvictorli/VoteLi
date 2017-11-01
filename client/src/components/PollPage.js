import React from 'react';
import PropTypes from 'prop-types';
import Validator from 'validator';
import { Doughnut } from 'react-chartjs-2';
import randomColor from 'randomcolor';

import api from '../api';

class PollPage extends React.Component {
  constructor(props) {
    super(props);
    const pollid = this.props.match.params.id;
    this.state = {
      loading: true,
      pollInfo: [],
      error: !Validator.isNumeric(pollid),
      pollid,
      topic: '',
      selectValue: '',
      colors: []
    };
  }

  componentDidMount() {
    const { error, pollid } = this.state;
    if (!error) {
      api.poll
        .getPollById(pollid)
        .then((pollInfo) => {
          this.setState({
            loading: false,
            pollInfo,
            topic: pollInfo[0].topic,
            selectValue: pollInfo[0].option,
            colors: randomColor({ count: pollInfo.length })
          });
        })
        .catch(() => {
          this.setState({ loading: false, error: true });
        });
    }
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ selectValue: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(this.state.selectValue);
  };

  render() {
    const { loading, pollInfo, pollid, error, value, colors, topic } = this.state;
    const chartData = {
      labels: [],
      votes: []
    };
    const choices = pollInfo.map((choice) => {
      chartData.labels.push(choice.option);
      chartData.votes.push(choice.votes);
      return (
        <option key={choice.choicesid} value={choice.option}>
          {choice.option}
        </option>
      );
    });

    const data = {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.votes,
          backgroundColor: colors,
          hoverBackgroundColor: colors
        }
      ]
    };

    return (
      <div>
        {error && <h1>This poll does not exist</h1>}
        {loading && !error && <p>Loading Poll Page for pollid: {pollid}...</p>}
        {!loading &&
          !error && (
            <div>
              <form onSubmit={this.handleSubmit}>
                <label htmlFor="vote">
                  I&apos;d like to vote for ...
                  <select value={value} onChange={this.handleChange}>
                    {choices}
                  </select>
                </label>
                <input type="submit" id="vote" value="Vote!" />
              </form>
              <h2>{topic}</h2>
              <Doughnut data={data} />
            </div>
          )}
      </div>
    );
  }
}

PollPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default PollPage;
