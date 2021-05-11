// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "./interfaces/IModStore.sol";

contract ModStore is IModStore {
    mapping(uint256 => Mod[]) private mods;

    IProjects public immutable override projects;
    IOperatorStore public immutable override operatorStore;

    uint256 public override modsId = 0;

    constructor(IProjects _projects, IOperatorStore _operatorStore) {
        projects = _projects;
        operatorStore = _operatorStore;
    }

    function allMods(uint256 _projectId)
        external
        view
        override
        returns (Mod[] memory)
    {
        return mods[_projectId];
    }

    /** 
      @notice Adds a mod to the list.
      @param _projectId The project to add a mod to.
      @param _beneficiary The address being funded from your tapped amount.
      @param _percent The percent of your target amount to send to the beneficiary of this mod. Out of 1000.
    */
    function addMod(
        uint256 _projectId,
        address payable _beneficiary,
        uint256 _amount,
        uint256 _percent
    ) external override {
        // Get a reference to the project owner.
        address _owner = projects.ownerOf(_projectId);

        // Only the project owner, or a delegated operator, can add a mod.
        require(
            msg.sender == _owner ||
                // Allow level 2 operators.
                operatorStore.operatorLevel(_owner, _projectId, msg.sender) >=
                2,
            "Juicer::addMod: UNAUTHORIZED"
        );

        // Either the amount or the percent must be specified.
        require(
            _amount > 0 || _percent > 0,
            "ModStore::addMod: UNSPECIFIED_PORTION"
        );

        // The percent should be less than 1000.
        require(_percent <= 1000, "ModStore::addMod: BAD_PERCENT");

        modsId++;
        mods[_projectId].push(
            Mod(_beneficiary, uint16(_percent), _amount, modsId)
        );

        emit AddMod(_projectId, modsId, _beneficiary, _amount, _percent);
    }

    /** 
      @notice Removes a mod from the list.
      @param _projectId The project to remove a mod from.
      @param _id The id of the mod to remove.
    */
    function removeMod(uint256 _projectId, uint256 _id) external override {
        // Get a reference to the project owner.
        address _owner = projects.ownerOf(_projectId);

        // Only the project owner, or a delegated operator, can remove a mod.
        require(
            msg.sender == _owner ||
                // Allow level 2 operators.
                operatorStore.operatorLevel(_owner, _projectId, msg.sender) >=
                2,
            "Juicer::removeMod: UNAUTHORIZED"
        );
        Mod[] memory _mods = mods[_projectId];
        delete mods[_projectId];
        for (uint256 _i = 0; _i < _mods.length; _i++) {
            if (_mods[_i].id != _id) mods[_projectId].push(_mods[_i]);
        }

        emit RemoveMod(_projectId, _id);
    }
}
