using System.Data;
using Microsoft.Data.SqlClient;

namespace Turis.Common.Helpers;

public class SqlHelper
{
    private readonly string _connectionString;

    public SqlHelper(string connectionString)
    {
        _connectionString = connectionString;
    }

    public void TruncateElmah()
    {
        var connection = new SqlConnection(_connectionString);
        var sql = "TRUNCATE TABLE ELMAH_Error";
        var command = new SqlCommand(sql)
        {
            Connection = connection
        };

        try
        {
            connection.Open();
            command.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            throw;
        }
        finally
        {
            connection?.Close();
        }
    }

    public object GetScalarValue(string sql, SqlParameter[] parameters = null)
    {
        return GetDataTable(sql, parameters).Rows[0][0];
    }

    public T GetScalarValue<T>(string sql, SqlParameter[] parameters = null)
    {
        var value = GetScalarValue(sql, parameters);
        return (T)Convert.ChangeType(value, typeof(T));
    }

    public DataTable GetDataTable(string sql, SqlParameter[] parameters = null)
    {
        var dt = new DataTable();
        var connection = new SqlConnection(_connectionString);
        var command = new SqlCommand(sql)
        {
            Connection = connection
        };
        if (parameters != null)
            command.Parameters.AddRange(parameters);
			
        try
        {
            connection.Open();
            var dataAdapter = new SqlDataAdapter(command);
            dataAdapter.Fill(dt);
            return dt;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            throw;
        }
        finally
        {
            connection?.Close();
        }
    }
}