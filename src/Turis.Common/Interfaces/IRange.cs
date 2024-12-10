﻿namespace Turis.Common.Interfaces;

public interface IRange<T>
{
    T Start { get; }
    T End { get; }
    bool Includes(T value);
    bool Includes(IRange<T> range);
}