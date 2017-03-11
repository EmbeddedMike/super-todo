import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { filterTable } from '../actions';
import ProductTable from '../components/ProductTable';
import { filterableTable } from '../styles/filterableTable.scss';


class SyncInput extends Component {
    constructor(props) {
        super(props);
        this.state = {hack: false};
        this.hack = false;
    }
    componentDidMount() {
        console.log('Mounted');
        this.fixTimer();
    }
    componentWillUnmount() {
        this.clearTimer();
    }
    clearTimer() {
      if( this.timer ){
        console.log("Clear timer");
        clearInterval(this.timer);
        this.timer = null;
      }
    }
    fixTimer() {
        console.log('Timer check: ' + this.state.hack);
        this.clearTimer(); /*clear if set*/
        if(this.hack) {
            console.log('Timer set');
            this.timer = setInterval(this.timerProc.bind(this), 1000);
        }
    }
    timerProc() {
        console.log('tick!');
        const event = new Event('input', { bubbles: true });
        this.input.dispatchEvent(event);
    }
    toggleButton() {
        console.log('toggle button');
        this.setState({hack: this.hack = !this.state.hack});
        this.fixTimer();
    }
    render() {
        return (<div>
          <input
            value={this.props.filter}
            ref={node => {this.input = node;}}
            onChange={() => this.props.onFilter(this.input.value)} />
          <button
              onClick={this.toggleButton.bind(this)}
              ref={node => {this.button = node;}}
              >{this.state.hack ? 'Hack!' : 'Hack?'}</button>
          </div>);
    }
}
SyncInput.propTypes = {
    filter: PropTypes.string,
    onFilter: PropTypes.func
};

const FilterableTable = ({ filter, onFilter }) => {
    return (
      <div className={filterableTable}>
          <SyncInput filter={filter} onFilter={onFilter} />

          <ProductTable filter={filter} />
      </div>
    );
};

FilterableTable.propTypes = {
    filter: PropTypes.string,
    onFilter: PropTypes.func
};

const mapStateToProps = (state) => {
    return {
        filter: state.filter
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onFilter: filterText => dispatch(filterTable(filterText))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FilterableTable);
