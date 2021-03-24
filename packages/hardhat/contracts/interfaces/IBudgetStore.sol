// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "./IPrices.sol";
import "./IBudgetBallot.sol";
import "../libraries/Budget.sol";

interface IBudgetStore {
    function latestBudgetId(uint256 _project) external view returns (uint256);

    function budgetCount() external view returns (uint256);

    function prices() external view returns (IPrices);

    function fee() external view returns (uint256);

    function getBudget(uint256 _budgetId)
        external
        view
        returns (Budget.Data memory);

    function getQueuedBudget(uint256 _projectId)
        external
        view
        returns (Budget.Data memory);

    function getCurrentBudget(uint256 _projectId)
        external
        view
        returns (Budget.Data memory);

    function configure(
        uint256 _projectId,
        uint256 _target,
        uint256 _currency,
        uint256 _duration,
        string memory _link,
        uint256 _discountRate,
        uint256 _bondingCurveRate,
        uint256 _reserved,
        IBudgetBallot _ballot
    ) external returns (Budget.Data memory budget);

    function payProject(
        uint256 _projectId,
        uint256 _amount,
        uint256 _feeBeneficiaryProjectId
    )
        external
        returns (
            Budget.Data memory budget,
            uint256 convertedCurrencyAmount,
            uint256 overflow,
            Budget.Data memory feeBeneficiaryBudget,
            uint256 feeBeneficiaryConvertedCurrencyAmount,
            uint256 feeBeneficiaryOverflow
        );

    function tap(
        uint256 _budgetId,
        uint256 _projectId,
        uint256 _amount,
        uint256 _currency
    )
        external
        returns (
            Budget.Data memory budget,
            uint256 convertedEthAmount,
            uint256 overflow
        );

    function setFee(uint256 _fee) external;
}
