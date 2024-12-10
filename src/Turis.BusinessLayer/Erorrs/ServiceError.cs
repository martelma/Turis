using OperationResults;

namespace Turis.BusinessLayer.Erorrs;

public record ServiceError(string Type, string Title, int Status, string Instance, string TraceId, ValidationError[] Errors = null);
