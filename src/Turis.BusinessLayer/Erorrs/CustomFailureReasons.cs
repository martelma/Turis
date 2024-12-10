using OperationResults;

namespace Turis.BusinessLayer.Erorrs;

public class CustomFailureReasons
{
    public const int LockedOut = FailureReasons.GenericError + 1;
    public const int NotAllowded = FailureReasons.GenericError + 2;
    public const int InvalidToken = FailureReasons.GenericError + 3;
    public const int PasswordExpired = FailureReasons.GenericError + 4;
}
