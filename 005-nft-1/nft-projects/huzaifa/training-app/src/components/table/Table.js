import './Table.scss';

const Table = ({ labels, values }) => (
  <div className="table">
    {
          labels.map((label, index) => (
            <div className="table-row" key={label}>
              <p className="label">{label}</p>
              <p className="value">{values[index]}</p>
            </div>
          ))
      }
  </div>
);

export default Table;
