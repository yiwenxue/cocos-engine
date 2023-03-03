/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { IVec3Like, Quat, Vec3 } from '../../../core';
import { HingeConstraint, PhysicsSystem } from '../../framework';
import { IHingeConstraint } from '../../spec/i-physics-constraint';
import { getTempTransform, PX, _pxtrans, _trans } from '../physx-adapter';
import { PhysXJoint } from './physx-joint';
import { toRadian } from '../../../core/math';

export class PhysXRevoluteJoint extends PhysXJoint implements IHingeConstraint {
    private _limitPair = new PX.PxJointAngularLimitPair(0, 0);

    setLimitEnabled (v: boolean): void {
        this._impl.setRevoluteJointFlag(PX.RevoluteJointFlags.eLIMIT_ENABLED, v);
        if (v) {
            this._impl.setLimit(this._limitPair);
        }
    }
    setLowerLimit (min: number): void {
        this._limitPair.lower = toRadian(this.constraint.lowerLimit);
        if (this.constraint.limitEnabled) {
            this._impl.setLimit(this._limitPair);
        }
    }
    setUpperLimit (max: number): void {
        this._limitPair.upper = toRadian(this.constraint.upperLimit);
        if (this.constraint.limitEnabled) {
            this._impl.setLimit(this._limitPair);
        }
    }
    setMotorEnabled (v: boolean): void {
        this._impl.setRevoluteJointFlag(PX.RevoluteJointFlags.eDRIVE_ENABLED, v);
        if (v) {
            this._impl.setDriveVelocity(this.constraint.motorVelocity * PhysicsSystem.instance.fixedTimeStep, false);
            this._impl.setDriveForceLimit(this.constraint.motorForceLimit);
        }
    }
    setMotorVelocity (v: number): void {
        if (this.constraint.motorEnabled) {
            this._impl.setDriveVelocity(PhysicsSystem.instance.fixedTimeStep * v, false);
        }
    }
    setMotorForceLimit (v: number): void {
        if (this.constraint.motorEnabled) {
            this._impl.setDriveForceLimit(v);
        }
    }

    setPivotA (v: IVec3Like): void {
        const cs = this.constraint;
        const pos = _trans.translation;
        const rot = _trans.rotation;
        Vec3.multiply(pos, cs.node.worldScale, cs.pivotA);
        Quat.rotationTo(rot, Vec3.UNIT_X, cs.axis);
        this._impl.setLocalPose(0, getTempTransform(pos, rot));
        if (!cs.connectedBody) this.setPivotB(cs.pivotB);
    }

    setPivotB (v: IVec3Like): void {
        const cs = this.constraint;
        const cb = cs.connectedBody;
        const pos = _trans.translation;
        const rot = _trans.rotation;
        Quat.rotationTo(rot, Vec3.UNIT_X, cs.axis);
        if (cb) {
            Vec3.multiply(pos, cb.node.worldScale, cs.pivotB);
        } else {
            const node = cs.node;
            Vec3.multiply(pos, node.worldScale, cs.pivotA);
            Vec3.add(pos, pos, node.worldPosition);
            Vec3.add(pos, pos, cs.pivotB);
            Quat.multiply(rot, rot, node.worldRotation);
        }
        this._impl.setLocalPose(1, getTempTransform(pos, rot));
    }

    setAxis (v: IVec3Like): void {
        this.setPivotA(this.constraint.pivotA);
        this.setPivotB(this.constraint.pivotB);
    }

    get constraint (): HingeConstraint {
        return this._com as HingeConstraint;
    }

    onComponentSet (): void {
        this._impl = PX.createRevoluteJoint(PhysXJoint.tempActor, _pxtrans, null, _pxtrans);

        this._limitPair.stiffness = 1;
        this._limitPair.damping = 0;
        this._limitPair.restitution = 0.4;
        this._limitPair.contactDistance = 0.01;

        this._impl.setConstraintFlag(6, true); // enable projection for both bodies
        this._impl.setConstraintFlag(32, true); // enable force limit
        this._impl.setProjectionAngularTolerance(0.2);
        this._impl.setProjectionLinearTolerance(0.2);

        this.setPivotA(this.constraint.pivotA);
        this.setPivotB(this.constraint.pivotB);

        const constraint = this.constraint;
        this.setLimitEnabled(constraint.limitEnabled);
        this.setMotorEnabled(constraint.motorEnabled);
        this.setLowerLimit(constraint.lowerLimit);
        this.setUpperLimit(constraint.upperLimit);
        this.setMotorVelocity(constraint.motorVelocity);
        this.setMotorForceLimit(constraint.motorForceLimit);
    }

    updateScale0 () {
        this.setPivotA(this.constraint.pivotA);
    }

    updateScale1 () {
        this.setPivotB(this.constraint.pivotB);
    }
}
