﻿namespace Turis.Common.Models.Requests;

public class ChangePasswordRequest
{
    public string OldPassword { get; set; }

    public string NewPassword { get; set; }

    public string PasswordConfirmation { get; set; }
}
