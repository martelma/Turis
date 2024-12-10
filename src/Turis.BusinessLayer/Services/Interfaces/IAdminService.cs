using JeMa.Shared;
using OperationResults;
using Turis.BusinessLayer.Services.Base;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IAdminService : IService
{
    Task<Result<IEnumerable<KeyValue>>> GetBackendConfiguration();
    Task<Result> TruncateElmah();
}