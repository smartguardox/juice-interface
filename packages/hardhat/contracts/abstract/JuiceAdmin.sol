// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import {
    UniswapV2Router02
} from "@uniswap/v2-periphery/contracts/UniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./../interfaces/IJuicer.sol";

import "./../TicketStore.sol";

/** 
  @notice A contract that inherits from JuiceAdmin can use Juice as a business-model-as-a-service.
  @dev The owner of the contract makes admin decisions such as:
    - Which address is the Budget owner, which can tap funds from the Budget.
    - Should this project's Tickets be migrated to a new Juicer. 
*/
abstract contract JuiceAdmin is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    modifier onlyBudgetOwner {
        require(msg.sender == budgetOwner, "JuiceAdmin: UNAUTHORIZED");
        _;
    }

    /// @notice The Juicer contract that is being used.
    IJuicer public juicer;

    /// @dev The router to use to execute swaps.
    UniswapV2Router02 public router;

    /// @dev The name of this Budget owner's tickets.
    string public ticketName;

    /// @dev The symbol of this Budget owner's tickets.
    string public ticketSymbol;

    /// @dev The address that can tap the Budget.
    address public budgetOwner;

    /** 
      @param _juicer The juicer that is being administered.
      @param _ticketName The name for this project's ERC-20 Tickets.
      @param _ticketSymbol The symbol for this project's ERC-20 Tickets.
    */
    constructor(
        IJuicer _juicer,
        string memory _ticketName,
        string memory _ticketSymbol
    ) internal {
        juicer = _juicer;
        ticketName = _ticketName;
        ticketSymbol = _ticketSymbol;

        budgetOwner = msg.sender;
    }

    /** 
        @notice Issues this project's Tickets. 
        @dev This must be called before a Budget is configured.
    */
    function issueTickets() external onlyOwner {
        juicer.issueTickets(ticketName, ticketSymbol);
    }

    /**
        @notice This is how the Budget is configured, and reconfiguration over time.
        @param _target The new Budget target amount.
        @param _duration The new duration of your Budget.
        @param _link A link to information about the Budget.
        @param _discountRate A number from 70-130 indicating how valuable a Budget is compared to the owners previous Budget,
        effectively creating a recency discountRate.
        If it's 100, each Budget will have equal weight.
        If the number is 130, each Budget will be treated as 1.3 times as valuable than the previous, meaning sustainers get twice as much redistribution shares.
        If it's 0.7, each Budget will be 0.7 times as valuable as the previous Budget's weight.
        @param _o The percentage of this Budget's surplus to allocate to the owner.
        @param _b The percentage of this Budget's surplus to allocate towards a beneficiary address. This can be another contract, or an end user address.
        An example would be a contract that allocates towards a specific purpose, such as Gitcoin grant matching.
        @param _bAddress The address of the beneficiary contract where a specified percentage is allocated.
        @return _budgetId The ID of the Budget that was reconfigured.
    */
    function configureBudget(
        uint256 _target,
        uint256 _duration,
        string calldata _link,
        uint256 _discountRate,
        uint256 _o,
        uint256 _b,
        address _bAddress
    ) external onlyBudgetOwner returns (uint256) {
        return
            juicer.configureBudget(
                _target,
                _duration,
                _link,
                _discountRate,
                _o,
                _b,
                _bAddress
            );
    }

    /** 
      @notice Redeem tickets that have been transfered to this contract and use the returned amount to fund this contract's Budget.
      @param _issuer The issuer who's tickets are being redeemed.
      @param _amount The amount of tickets being redeemed.
      @param _minReturn The minimum amount of tokens expected in return.
      @param _juicer The Juicer to redeem from.
    */
    function redeemTicketsAndFund(
        address _issuer,
        uint256 _amount,
        uint256 _minReturn,
        IJuicer _juicer
    ) external onlyBudgetOwner {
        uint256 _returnAmount =
            _juicer.redeem(_issuer, _amount, _minReturn, address(this));

        // Surplus goes back to the issuer.
        _juicer.payOwner(address(this), _returnAmount, _issuer);
    }

    /** 
      @notice Taps the funds available in the Budget.
      @param _budgetId The ID of the Budget to tap.
      @param _amount The amount to tap.
      @param _beneficiary The address to transfer the funds to.
    */
    function tapBudget(
        uint256 _budgetId,
        uint256 _amount,
        address _beneficiary
    ) external onlyBudgetOwner {
        juicer.tapBudget(_budgetId, _amount, _beneficiary);
    }

    /** 
        @notice Sets the address that can tap the Budget. 
        @param _budgetOwner The new Budget owner.
    */
    function setBudgetOwner(address _budgetOwner) external onlyOwner {
        budgetOwner = _budgetOwner;
    }

    /** 
      @notice Migrates the ability to mint and redeem this contract's Tickets to a new Juicer.
      @dev The destination must be in the current Juicer's allow list.
      @param _to The new contract that will manage your Tickets and it's funds.
    */
    function migrate(IJuicer _to) public onlyOwner {
        require(_to != IJuicer(0), "JuiceAdmin::setJuicer: ZERO_ADDRESS");
        juicer.migrate(address(_to));
        // Sets the Juicer that this contract uses.
        juicer = _to;
    }
}
